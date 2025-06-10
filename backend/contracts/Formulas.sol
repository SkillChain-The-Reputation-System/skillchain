// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./Constants.sol";
import {UD60x18, ud, convert, pow, exp, ln, intoUint256} from "@prb/math/src/UD60x18.sol";

library RewardTokenFormulas {
    function calculateWeight(
        uint256 di_raw,
        uint256 ri_raw,
        uint256 alpha_raw,
        uint256 beta_raw
    ) internal pure returns (uint256) {
        UD60x18 alpha = ud(alpha_raw);
        UD60x18 beta = ud(beta_raw);
        UD60x18 ri = ud(ri_raw * 1e18);

        UD60x18 di = ud(di_raw * 1e18);

        UD60x18 ri_power_beta = pow(ri, beta);

        UD60x18 alpha_di = alpha.mul(di);
        UD60x18 exp_negative_alpha_di = ud(1e18).div(exp(alpha_di));

        UD60x18 weight = ri_power_beta.mul(exp_negative_alpha_di);

        return intoUint256(weight);
    }

    function calculateWeightForModerator(
        uint256 di_raw,
        uint256 ri_raw
    ) external pure returns (uint256) {
        uint256 weight = calculateWeight(
            di_raw,
            ri_raw,
            SystemConsts.MODERATION_REWARD_DISTRIBUTION_SPREAD,
            SystemConsts.MODERATION_REPUTATION_INFLUENCE_COEFFICIENT
        );
        return weight;
    }

    function calculateWeightForEvaluator(
        uint256 di_raw,
        uint256 si_raw
    ) external pure returns (uint256) {
        uint256 weight = calculateWeight(
            di_raw,
            si_raw,
            SystemConsts.EVALUATION_REWARD_DISTRIBUTION_SPREAD,
            SystemConsts.EVALUATION_STAKE_INFLUENCE_COEFFICIENT
        );
        return weight;
    }

    function calculateReward(
        uint256 weight,
        uint256 total_weight,
        uint256 total_reward
    ) external pure returns (uint256) {
        // 1) Convert inputs to UD60x18 format
        UD60x18 wi = ud(weight);
        UD60x18 total_w = ud(total_weight);
        UD60x18 reward_pool = ud(total_reward);

        // 2) Calculate the proportion: w_i / sum(w_i)
        UD60x18 proportion = wi.div(total_w);

        // 3) Calculate the reward: R_i = (w_i / sum(w_i)) * R_pool
        UD60x18 reward = proportion.mul(reward_pool);

        // 4) Return the result divided by 1e18 using convert()
        return intoUint256(reward);
    }
}
library ChallengeCostFormulas {
    function calculateCost(
        uint256 _difficultyWeight,
        uint256 _qualityScore,
        uint256 _bounty,
        uint256 _n_i
    ) external pure returns (uint256) {
        UD60x18 fMin = ud(SystemConsts.CHALLENGE_FEE_MIN);
        UD60x18 fMax = ud(SystemConsts.CHALLENGE_FEE_MAX);
        UD60x18 alpha = ud(SystemConsts.CHALLENGE_FEE_ALPHA);
        UD60x18 beta = ud(SystemConsts.CHALLENGE_FEE_BETA);
        UD60x18 gamma = ud(SystemConsts.CHALLENGE_FEE_GAMMA);
        UD60x18 bounty = ud(_bounty);
        UD60x18 expectedParticipants = ud(
            SystemConsts.EXPECTED_PARTICIPANTS * 1e18
        ); // Scale up to 1e18
        UD60x18 n_i = ud(_n_i * 1e18); // Scale up to 1e18

        UD60x18 Wd = ud(_difficultyWeight);
        UD60x18 Q = ud(_qualityScore * 1e16); // convert to range [0,1]

        UD60x18 fBase = fMin.add(alpha.mul(Wd)).add(beta.mul(Q));

        UD60x18 fBonus = ud(0);
        if (expectedParticipants.gt(ud(0)) && bounty.gt(ud(0))) {
            UD60x18 ratio = bounty.div(expectedParticipants);
            UD60x18 decay = exp(beta.mul(n_i)); // decay factor based on beta and n_i
            UD60x18 expPart = ud(1e18).div(decay);
            fBonus = ratio.mul(expPart).mul(gamma);
        }

        UD60x18 total = fBase.add(fBonus);

        if (total.lt(fMin)) {
            return SystemConsts.CHALLENGE_FEE_MIN;
        }
        if (total.gt(fMax)) {
            return SystemConsts.CHALLENGE_FEE_MAX;
        }
        return intoUint256(total);
    }
}

library RecruitmentFeeFormulas {
    function calculateRecruitmentFee(
        uint256 reputation
    ) external pure returns (uint256) {
        UD60x18 baseFee = ud(SystemConsts.RECRUITMENT_BASE_FEE);
        UD60x18 k = ud(SystemConsts.RECRUITMENT_REPUTATION_COEFFICIENT);
        UD60x18 R = ud(reputation * 1e18);

        UD60x18 lnTerm = ln(ud(1e18).add(R));
        UD60x18 factor = ud(1e18).add(k.mul(lnTerm));
        UD60x18 fee = baseFee.mul(factor);

        return intoUint256(fee);
    }
}
