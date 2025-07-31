// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

contract HTLCEscrow {
    address public maker;
    uint256 public amount;
    bytes32 public hashlock;
    uint256 public timelock;
    bool public withdrawn;
    bool public cancelled;

    event EscrowCreated(address indexed maker, uint256 amount, bytes32 hashlock, uint256 timelock);
    event EscrowWithdrawn(address indexed taker, bytes32 secret);
    event EscrowCancelled(address indexed maker);

    constructor(
        bytes32 _hashlock,
        uint256 _timelock   
    ) payable {
        maker = msg.sender;
        hashlock = _hashlock;
        timelock = _timelock;
        amount = msg.value;
        withdrawn = false;
        cancelled = false;
        emit EscrowCreated(maker, amount, hashlock, timelock);
    }

    function withdraw(bytes32 _secret, address _taker) external {
        require(!withdrawn, "Already withdrawn");
        require(!cancelled, "Already cancelled");
        require(sha256(abi.encodePacked(_secret)) == hashlock, "Wrong secret");
        require(block.timestamp < timelock, "Too late to withdraw");
        require(_taker != address(0), "Invalid taker");

        withdrawn = true;
        payable(_taker).transfer(amount);
        emit EscrowWithdrawn(_taker, _secret);
    }

    function cancel() external {
        require(!withdrawn, "Already withdrawn");
        require(!cancelled, "Already cancelled");
        require(msg.sender == maker, "Only maker can cancel");
        require(block.timestamp >= timelock, "Too early to cancel");

        cancelled = true;
        payable(maker).transfer(amount);
        emit EscrowCancelled(maker);
    }

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function getStatus()
        external
        view
        returns (
            address _maker,
            uint256 _amount,
            bytes32 _hashlock,
            uint256 _timelock,
            bool _withdrawn,
            bool _cancelled,
            uint256 _currentTime
        )
    {
        return (maker, amount, hashlock, timelock, withdrawn, cancelled, block.timestamp);
    }

    function isValidSecret(bytes32 _secret) external view returns (bool) {
        return sha256(abi.encodePacked(_secret)) == hashlock;
    }

    function isActive() external view returns (bool) {
        return !withdrawn && !cancelled && block.timestamp < timelock;
    }
}
