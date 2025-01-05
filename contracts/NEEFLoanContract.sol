// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./MalawiKwachaToken.sol";
import "./LandTitleDeed.sol";


contract NEEFLoanContract {
    address public admin;
    uint256 public loanCounter;
    MalawiKwachaToken public token;
    LandTitleDeed public landTitleDeed;

    uint256 public constant GRACE_PERIOD = 4 * 30 days; // 4 months
    uint256 public constant REPAYMENT_PERIOD = 5 * 30 days; // 5 months
    uint256 public constant REDEMPTION_PERIOD = 365 days; // 1 year
    uint256 public constant REDEMPTION_INTEREST = 10; // 10% interest rate

    enum LoanType { Individual, Group }
    enum LoanStatus { Pending, Approved, Disbursed, Repaid, Defaulted }

    struct Loan {
        uint256 loanId;
        LoanType loanType;
        address borrower;
        uint256 amount;
        uint256 repaymentAmount;
        uint256 disbursedTimestamp;
        LoanStatus status;
        uint256 balance;
        uint256 collateralDeedId; // Land deed used as collateral
    }

    mapping(uint256 => Loan) public loans;
    mapping(address => uint256[]) public borrowerLoans;

    event LoanCreated(uint256 indexed loanId, address indexed borrower, uint256 amount, LoanType loanType);
    event LoanDisbursed(uint256 indexed loanId, uint256 amount);
    event LoanRepaid(uint256 indexed loanId, uint256 repaymentAmount);
    event LoanDefaulted(uint256 indexed loanId);
    event CollateralSeized(uint256 indexed loanId, uint256 deedId);
    event CollateralReclaimed(uint256 indexed loanId, uint256 deedId);
    event CollateralSold(uint256 indexed deedId);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    constructor(address tokenAddress, address landTitleDeedAddress) {
        admin = msg.sender;
        token = MalawiKwachaToken(tokenAddress);
        landTitleDeed = LandTitleDeed(landTitleDeedAddress);
    }

    function createLoan(
        address borrower,
        uint256 amount,
        LoanType loanType,
        uint256 collateralDeedId
    ) external returns (uint256) {
        require(borrower != address(0), "Invalid borrower address");
        require(amount > 0, "Loan amount must be greater than zero");
        require(landTitleDeed.isDeedValid(collateralDeedId), "Invalid collateral deed");
        require(
            landTitleDeed.getCollateralAmount(collateralDeedId) > amount,
            "Insufficient collateral value"
        );

        loanCounter++;
        uint256 repaymentAmount = calculateRepaymentAmount(amount);

        loans[loanCounter] = Loan({
            loanId: loanCounter,
            loanType: loanType,
            borrower: borrower,
            amount: amount,
            repaymentAmount: repaymentAmount,
            disbursedTimestamp: 0,
            status: LoanStatus.Pending,
            balance: repaymentAmount,
            collateralDeedId: collateralDeedId
        });

        borrowerLoans[borrower].push(loanCounter);

        emit LoanCreated(loanCounter, borrower, amount, loanType);
        return loanCounter;
    }

    function disburseLoan(uint256 loanId) external onlyAdmin {
        Loan storage loan = loans[loanId];
        require(loan.status == LoanStatus.Pending, "Loan must be in Pending status");

        loan.status = LoanStatus.Disbursed;
        loan.disbursedTimestamp = block.timestamp;

        require(token.transfer(loan.borrower, loan.amount), "Token transfer failed");

        emit LoanDisbursed(loanId, loan.amount);
    }

    function repayLoan(uint256 loanId, uint256 repaymentAmount) external {
        Loan storage loan = loans[loanId];
        require(loan.status == LoanStatus.Disbursed, "Loan must be in Disbursed status");
        require(repaymentAmount > 0, "Repayment amount must be greater than zero");

        require(token.transferFrom(msg.sender, address(this), repaymentAmount), "Token transfer failed");

        loan.balance -= repaymentAmount;
        if (loan.balance == 0) {
            loan.status = LoanStatus.Repaid;
        }

        emit LoanRepaid(loanId, repaymentAmount);
    }

    function checkForDefault(uint256 loanId) public {
        Loan storage loan = loans[loanId];
        require(loan.status == LoanStatus.Disbursed, "Loan must be in Disbursed status");

        uint256 elapsedTime = block.timestamp - loan.disbursedTimestamp;
        if (elapsedTime > GRACE_PERIOD + REPAYMENT_PERIOD && loan.balance > 0) {
            loan.status = LoanStatus.Defaulted;
            uint256 deedId = loan.collateralDeedId;
            landTitleDeed.safeTransferFrom(loan.borrower, address(this), deedId, 1, "");

            emit LoanDefaulted(loanId);
            emit CollateralSeized(loanId, deedId);
        }
    }

    function reclaimCollateral(uint256 loanId) external {
        Loan storage loan = loans[loanId];
        require(loan.status == LoanStatus.Defaulted, "Loan must be in Defaulted status");

        uint256 elapsedTime = block.timestamp - loan.disbursedTimestamp;
        require(elapsedTime <= GRACE_PERIOD + REPAYMENT_PERIOD + REDEMPTION_PERIOD, "Redemption period expired");

        uint256 redemptionAmount = loan.balance + (loan.balance * REDEMPTION_INTEREST / 100);
        require(token.transferFrom(msg.sender, address(this), redemptionAmount), "Token transfer failed");

        landTitleDeed.safeTransferFrom(address(this), msg.sender, loan.collateralDeedId, 1, "");

        emit CollateralReclaimed(loanId, loan.collateralDeedId);
    }

    function sellCollateral(uint256 deedId) external onlyAdmin {
        require(landTitleDeed.balanceOf(address(this), deedId) > 0, "Collateral not held by contract");

        //landTitleDeed.burn(address(this), deedId, 1);

        emit CollateralSold(deedId);
    }

    function getLoansByBorrower(address borrower) external view returns (uint256[] memory) {
        return borrowerLoans[borrower];
    }

    function calculateRepaymentAmount(uint256 amount) internal pure returns (uint256) {
        uint256 interestRate = 4; // 4% interest rate
        return amount + (amount * interestRate / 100);
    }
}
