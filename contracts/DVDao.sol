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
        address Candidate;
        // deadline - the UNIX timestamp until which this proposal is active. Proposal can be executed after the deadline has been exceeded.
        uint256 deadline;
        // yayVotes - number of yay votes for this proposal
        uint256 upVotes;
        // nayVotes - number of nay votes for this proposal
        uint256 downVotes;
        // executed - whether or not this proposal has been executed yet. Cannot be executed before the deadline has been exceeded.
        bool executed;
        // voters - a mapping of CryptoDevsNFT tokenIDs to booleans indicating whether that NFT has already been used to cast a vote or not
        mapping(address => bool) voters;
    }

    // Create a mapping of ID to Proposal
    mapping(uint256 => Proposal) public proposals;
    // Number of proposals that have been created
    uint256 public numProposals;

    IDVideos dVideosNFT;

    constructor(address _dVideosNFT) payable ERC20("dVideos DAO", "DVD") {
        dVideosNFT = IDVideos(_dVideosNFT);
        _mint(address(this), 50000 * 10**decimals());
    }

    modifier nftHolderOnly() {
        require(dVideosNFT.balanceOf(msg.sender) > 0, "NOT_A_DAO_MEMBER");
        _;
    }

    function createProposal(address _Candidate)
        external
        nftHolderOnly
        returns (uint256)
    {
        Proposal storage proposal = proposals[numProposals];
        proposal.Candidate = _Candidate;

        proposal.deadline = block.timestamp + 1 days;

        numProposals++;

        return numProposals - 1;
    }

    modifier activeProposalOnly(uint256 proposalIndex) {
        require(
            proposals[proposalIndex].deadline > block.timestamp,
            "DEADLINE_EXCEEDED"
        );
        _;
    }

    enum Vote {
        UP, // YAY = 0
        DOWN // NAY = 1
    }

    function voteOnProposal(uint256 proposalIndex, Vote vote)
        external
        nftHolderOnly
        activeProposalOnly(proposalIndex)
    {
        Proposal storage proposal = proposals[proposalIndex];

        uint256 voterNFTBalance = dVideosNFT.balanceOf(msg.sender);
        uint256 numVotes = 0;

        if (vote == Vote.UP) {
            proposal.upVotes = proposal.upVotes + 1;
        } else {
            proposal.downVotes = proposal.downVotes + 1;
        }
    }

    modifier inactiveProposalOnly(uint256 proposalIndex) {
        require(
            proposals[proposalIndex].deadline <= block.timestamp,
            "DEADLINE_NOT_EXCEEDED"
        );
        require(
            proposals[proposalIndex].executed == false,
            "PROPOSAL_ALREADY_EXECUTED"
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
            ERC20(address(this)).transfer(address(proposal.Candidate), 500);
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
