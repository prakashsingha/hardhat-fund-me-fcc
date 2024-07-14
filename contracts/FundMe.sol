// SPDX-License-Identifier: MIT
// Pragma
pragma solidity 0.8.24;

//Imports
import './PriceConverter.sol';
import 'hardhat/console.sol';

// Error Codes
error FundMe__NotOwner();

// Interfaces, Libraries, Contract

/**
 * @title A contract for crowd funding
 * @author My name
 * @notice This contract is to demo sample funding contract
 * @dev This implements price feeds as our library
 */

contract FundMe {
    // Type declarations
    using PriceConverter for uint256;

    // State variables
    uint256 public constant MIN_USD = 50 * 1e18; // 1 * 10 ** 18
    address[] private s_funders;
    mapping(address => uint256) private s_addressToAmountFunded;
    address private immutable i_owner;

    AggregatorV3Interface private s_priceFeed;

    event Funded(
        address indexed funder,
        uint256 amount,
        uint256 conversionRate
    );

    // Modifiers
    modifier onlyOwner() {
        if (msg.sender != i_owner) {
            revert FundMe__NotOwner();
        }
        _;
    }

    constructor(AggregatorV3Interface _priceFeedAddress) {
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(_priceFeedAddress);
    }

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }

    /** @notice This function funds this contract
     *  @dev This implements price feeds as our library
     */
    function fund() public payable {
        uint256 conversionRate = msg.value.getConversionRate(s_priceFeed);
        require(conversionRate >= MIN_USD, 'Amount must be minimum of 50 USD');
        s_funders.push(msg.sender);
        s_addressToAmountFunded[msg.sender] = msg.value;

        emit Funded(msg.sender, msg.value, conversionRate);
    }

    function withdraw() public onlyOwner {
        for (uint256 i = 0; i < s_funders.length; i++) {
            address funder = s_funders[i];
            s_addressToAmountFunded[funder] = 0;
        }

        //reset the array
        s_funders = new address[](0);
        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }('');
        require(callSuccess, 'Withdraw failed!');
    }

    function cheaperWithdraw() public onlyOwner {
        address[] memory funders = s_funders;
        // mappings can't be in memory
        for (uint256 i = 0; i < funders.length; i++) {
            address funder = funders[i];
            s_addressToAmountFunded[funder] = 0;
        }

        //reset the array
        s_funders = new address[](0);
        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }('');
        require(callSuccess, 'Withdraw failed!');
    }

    // view/pure

    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getFunder(uint256 index) public view returns (address) {
        return s_funders[index];
    }

    function getAddressToAmountFunded(
        address funderAddress
    ) public view returns (uint256) {
        return s_addressToAmountFunded[funderAddress];
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }
}
