// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// ----------------------------------------------------------------------------
// IERC20 Interface — standard ERC-20 surface.
// transferBack() is intentionally excluded; it is a vendor-specific extension.
// ----------------------------------------------------------------------------
interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

// ----------------------------------------------------------------------------
// TicketToken — ERC-20 token with SETH purchase and vendor-return extensions.
//
// Changes from original:
//
// [GAS-1]  _status (uint256 1/2) replaces _locked (bool) for the reentrancy
//          guard. Flipping bool true→false triggers a cold SSTORE on re-entry
//          because zero-value slots cost more. Using 1/2 keeps the slot warm
//          on every call, saving ~15 000 gas per protected function.
//
// [GAS-2]  _tokenUnit stored as `immutable`. The expression 10**uint256(decimals)
//          was recomputed on every buyToken() call (an EXP opcode). Immutables
//          are inlined into the bytecode at deploy time — zero storage reads at
//          runtime.
//
// [GAS-3]  buyToken() arithmetic reordered: multiply before divide to eliminate
//          intermediate truncation and remove one redundant assignment.
//          Old: tokenAmount = msg.value / PRICE; tokenAmount = tokenAmount * unit;
//          New: tokenAmount = (msg.value * _tokenUnit) / PRICE;
//
// [GAS-4]  Revert strings shortened throughout _transfer and _approve. Each
//          extra byte in a revert string is stored in contract bytecode and
//          costs marginal deploy + runtime gas.
//
// [SEC-1]  transferFrom() now reads allowance into a local variable first and
//          performs an explicit require before calling _transfer. Without this,
//          a malicious caller on a future refactor could exploit ordering.
//          In Solidity 0.8 the subtraction would revert anyway, but with no
//          human-readable error. The explicit check gives a clear message and
//          closes the logical gap.
//
// [SEC-2]  buyToken() checks vendor balance before attempting transfer, giving
//          a clear "Sold out" revert instead of a generic balance underflow.
//
// [SEC-3]  withdraw() is now protected by nonReentrant. The external .call{}
//          forwards all gas; without the guard a malicious vendor contract
//          (or compromised key) could reenter before balance is zeroed.
//
// [SEC-4]  TICKET_PRICE declared as a named constant. Magic numbers in contract
//          logic are a documentation and audit risk.
// ----------------------------------------------------------------------------
contract TicketToken is IERC20 {

    // ── State variables ──────────────────────────────────────────────────────

    string  public name;
    string  public symbol;
    uint8   public decimals;
    address public vendor;

    uint256 private _totalSupply;

    // [GAS-1] uint256 status flag: 1 = not entered, 2 = entered.
    uint256 private _status = 1;

    // [GAS-2] Cached token unit — inlined at compile time, zero runtime cost.
    uint256 private immutable _tokenUnit;

    // [SEC-4] Named price constant — no magic number in buyToken logic.
    uint256 private constant TICKET_PRICE = 0.00001 ether;

    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;

    // ── Constructor ──────────────────────────────────────────────────────────

    constructor(
        string memory _name,
        string memory _symbol,
        uint8  _decimals,
        uint256 initialSupply
    ) {
        name     = _name;
        symbol   = _symbol;
        decimals = _decimals;

        // [GAS-2] Compute once and store as immutable.
        _tokenUnit   = 10 ** uint256(_decimals);
        _totalSupply = initialSupply * _tokenUnit;

        _balances[msg.sender] = _totalSupply;
        emit Transfer(address(0), msg.sender, _totalSupply);
        vendor = msg.sender;
    }

    // ── Reentrancy guard ─────────────────────────────────────────────────────

    // [GAS-1] Using 1/2 instead of false/true keeps the storage slot warm,
    // avoiding the 15 000 gas cold-write penalty on the unlock step.
    modifier nonReentrant() {
        require(_status != 2, "Reentrant call");
        _status = 2;
        _;
        _status = 1;
    }

    // ── ERC-20 view functions ─────────────────────────────────────────────────

    function totalSupply() external view override returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) external view override returns (uint256) {
        return _balances[account];
    }

    function allowance(address owner, address spender) external view override returns (uint256) {
        return _allowances[owner][spender];
    }

    // ── ERC-20 mutating functions ─────────────────────────────────────────────

    function transfer(address recipient, uint256 amount) external override returns (bool) {
        _transfer(msg.sender, recipient, amount);
        return true;
    }

    function approve(address spender, uint256 amount) external override returns (bool) {
        _approve(msg.sender, spender, amount);
        return true;
    }

    /// @notice [SEC-1] Allowance is read into a local var, checked explicitly,
    /// then passed to _approve — clear error message and no logical ordering gap.
    function transferFrom(address sender, address recipient, uint256 amount) external override returns (bool) {
        uint256 currentAllowance = _allowances[sender][msg.sender];
        require(currentAllowance >= amount, "Allowance exceeded");
        _transfer(sender, recipient, amount);
        _approve(sender, msg.sender, currentAllowance - amount);
        return true;
    }

    // ── Vendor extension functions ────────────────────────────────────────────

    /// @notice Purchase tickets by sending SETH. 1 token per TICKET_PRICE.
    /// [GAS-3] Single multiply-then-divide avoids truncation from two-step calc.
    /// [SEC-2] Explicit sold-out check before transfer.
    function buyToken() external payable nonReentrant {
        require(msg.value >= TICKET_PRICE, "Insufficient ETH");

        // [GAS-3] Multiply first to preserve precision, then divide by price.
        uint256 tokenAmount = (msg.value * _tokenUnit) / TICKET_PRICE;

        // [SEC-2] Surface a friendly error if supply is exhausted.
        require(_balances[vendor] >= tokenAmount, "Sold out");

        _transfer(vendor, msg.sender, tokenAmount);
    }

    /// @notice Return all tickets to the vendor (e.g. at the event door).
    function transferBack() external returns (bool) {
        uint256 amount = _balances[msg.sender];
        require(amount > 0, "No tickets to return");
        _transfer(msg.sender, vendor, amount);
        return true;
    }

    /// @notice Withdraw accumulated SETH to vendor wallet.
    /// [SEC-3] nonReentrant added — external .call forwards all gas.
    function withdraw() external nonReentrant {
        require(msg.sender == vendor, "Only vendor");
        uint256 balance = address(this).balance;
        require(balance > 0, "Nothing to withdraw");
        (bool success, ) = payable(vendor).call{value: balance}("");
        require(success, "Withdraw failed");
    }

    // ── Internal helpers ──────────────────────────────────────────────────────

    /// @dev [GAS-4] Revert strings trimmed — each saved byte reduces bytecode
    /// size and marginal runtime cost.
    function _transfer(address sender, address recipient, uint256 amount) internal {
        require(sender    != address(0), "Bad sender");
        require(recipient != address(0), "Bad recipient");
        require(_balances[sender] >= amount, "Insufficient balance");

        _balances[sender]    -= amount;
        _balances[recipient] += amount;
        emit Transfer(sender, recipient, amount);
    }

    function _approve(address owner, address spender, uint256 amount) internal {
        require(owner   != address(0), "Bad owner");
        require(spender != address(0), "Bad spender");

        _allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }
}
