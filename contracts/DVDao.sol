// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

interface IDVideos {
    function balanceOf(address owner) external view returns (uint256);

    function getUserNFTID(address _address, uint256 _id)
        external
        view
        returns (uint256);
}

contract DVDao is ERC20, Ownable {
    struct Proposal {
        address candidate;
        uint256 deadline;
        uint256 upVotes;
        uint256 downVotes;
        bool executed;
        mapping(address => bool) voters;
    }

    enum Vote {
        UP,
        DOWN
    }

    mapping(uint256 => Proposal) public proposals;

    uint256 public numProposals;

    IDVideos dVideosNFT;

    constructor(address _dVideosNFT) payable ERC20("dVideos DAO", "DVD") {
        dVideosNFT = IDVideos(_dVideosNFT);
        _mint(address(this), 50000 * 10**decimals());
    }

    modifier nftHolderOnly() {
        require(dVideosNFT.balanceOf(msg.sender) > 0, "NOT A HOLDER");
        _;
    }

    function createProposal(address _candidate)
        external
        nftHolderOnly
        returns (uint256)
    {
        Proposal storage proposal = proposals[numProposals];
        proposal.candidate = _candidate;

        proposal.deadline = block.timestamp + 1 days;

        numProposals++;

        return numProposals - 1;
    }

    modifier activeProposalOnly(uint256 proposalIndex) {
        require(
            proposals[proposalIndex].deadline > block.timestamp,
            "TIME PASSED"
        );
        _;
    }

    function voteOnProposal(uint256 proposalIndex, Vote vote)
        external
        nftHolderOnly
        activeProposalOnly(proposalIndex)
    {
        Proposal storage proposal = proposals[proposalIndex];

        if (vote == Vote.UP) {
            proposal.upVotes = proposal.upVotes + 1;
        } else {
            proposal.downVotes = proposal.downVotes + 1;
        }
    }

    modifier inactiveProposalOnly(uint256 proposalIndex) {
        require(
            proposals[proposalIndex].deadline <= block.timestamp,
            "YOU ARE TO EARLY"
        );
        require(
            proposals[proposalIndex].executed == false,
            "PROPOSAL EXECUTED"
        );
        _;
    }

    function executeProposal(uint256 proposalIndex)
        external
        nftHolderOnly
        inactiveProposalOnly(proposalIndex)
    {
        Proposal storage proposal = proposals[proposalIndex];

        if (proposal.upVotes > proposal.downVotes) {
            ERC20(address(this)).transfer(address(proposal.candidate), 500);
        }
        proposal.executed = true;
    }

    function withdrawEther() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    receive() external payable {}

    fallback() external payable {}
}
