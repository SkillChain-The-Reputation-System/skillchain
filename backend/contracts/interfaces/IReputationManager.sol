// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "../Constants.sol";

interface IReputationManager {
    // ============================== UPDATE FUNCTIONS ==============================
    /// @notice Called after a solution is finalized -> Update the user's reputation who submitted the solution
    /// @param _user                address whose reputation to update
    /// @param _domain              the challenge domain
    /// @param _final_score         the consolidated solution score
    /// @param _threshold           threshold for no-change
    /// @param _scaling_constant    scaling constant
    /// @param _difficulty          weight of challenge difficulty
    function updateSolvingProblemReputation(
        address _user,
        SystemEnums.Domain _domain,
        uint256 _final_score,
        uint256 _threshold,
        uint256 _scaling_constant,
        SystemEnums.DifficultyLevel _difficulty
    ) external;

    /// @notice Called after a solution is finalized -> Update the reviewer's reputation who reviewed the solution
    /// @param _reviewer            address to update
    /// @param _domain              domain of the challenge reviewed
    /// @param _final_score         the finalized score
    /// @param _evaluate_score      the score given by the reviewer
    /// @param _threshold           allowable deviation for no-change
    /// @param _scaling_constant    scaling constant
    function updateEvaluateSolutionReputation(
        address _reviewer,
        SystemEnums.Domain _domain,
        uint256 _final_score,
        uint256 _evaluate_score,
        uint256 _threshold,
        uint256 _scaling_constant
    ) external;

    /// @notice Called after a challenge is finalized -> Update the contributor's reputation who made the challenge
    /// @param _contributor         address to update
    /// @param _domain              domain of the challenge
    /// @param _quality_score       the final quality score
    /// @param _threshold           threshold for no-change
    /// @param _scaling_constant    scaling constant
    /// @param _difficulty          consolidated difficulty of the challenge (after moderation)
    function updateContributionReputation(
        address _contributor,
        SystemEnums.Domain _domain,
        uint256 _quality_score,
        uint256 _threshold,
        uint256 _scaling_constant,
        SystemEnums.DifficultyLevel _difficulty
    ) external;

    /// @notice Called after a challenge is finalized -> Update the moderator's reputation who review the challenge
    /// @param _moderator           address to update
    /// @param _domain              domain of the challenge they moderated
    /// @param _quality_score       the final quality score
    /// @param _review_score        the score given by the moderator
    /// @param _threshold           allowable deviation for no-change
    /// @param _scaling_constant    scaling constant
    function updateModerationReputation(
        address _moderator,
        SystemEnums.Domain _domain,
        uint256 _quality_score,
        uint256 _review_score,
        uint256 _threshold,
        uint256 _scaling_constant
    ) external;

    // ============================== GETTER FUNCTIONS ==============================
    function getDomainReputation(
        address _user,
        SystemEnums.Domain _domain
    ) external view returns (int256);

    function getAllDomainReputation(
        address _user
    ) external view returns (int256[14] memory);

    function getGlobalReputation(address _user) external view returns (int256);

    // ============================== PUBLIC STATE VARIABLES ==============================
    function N_DOMAIN() external view returns (uint256);

    function domain_reputation(
        address,
        SystemEnums.Domain
    ) external view returns (int256);

    function global_reputation(address) external view returns (int256);
}
