// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./Constants.sol";
import {UD60x18, ud, convert, pow, exp, intoUint256} from "@prb/math/src/UD60x18.sol";

library RewardTokenFormulas {
    function calculateWeight(
        uint256 di_raw,
        uint256 si_raw,
        uint256 alpha_raw,
        uint256 beta_raw
    ) internal pure returns (uint256) {
        // 1) Convert the constants to UD60x18 format
        UD60x18 alpha = ud(alpha_raw);
        UD60x18 beta = ud(beta_raw);

        // 2) Scale the inputs to 1e18 and wrap them into UD60x18
        UD60x18 di = ud(di_raw * 1e18);
        UD60x18 si = ud(si_raw * 1e18);

        // 3) Calculate S_i^β using the pow function
        UD60x18 si_power_beta = pow(si, beta);

        // 4) Calculate -α * d_i
        UD60x18 negative_alpha_di = alpha.mul(di);

        // 5) Calculate e^(-α * d_i)
        // Since exp function expects positive values, we need to calculate exp(-x) = 1/exp(x)
        UD60x18 exp_negative_alpha_di = ud(1e18).div(exp(negative_alpha_di));

        // 6) Calculate final weight: w_i = S_i^β * e^(-α * d_i)
        UD60x18 weight = si_power_beta.mul(exp_negative_alpha_di);

        return intoUint256(weight);
    }

    function calculateWeightForModerator(
        uint256 di_raw,
        uint256 si_raw
    ) external pure returns (uint256) {
        uint256 weight = calculateWeight(
            di_raw,
            si_raw,
            SystemConsts.MODERATION_REWARD_DISTRIBUTION_SPREAD,
            SystemConsts.MODERATION_STAKE_INFLUENCE_COEFFICIENT
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
        UD60x18 reward_pool = ud(total_reward * 1e18); // Scale up total_reward to 1e18

        // 2) Calculate the proportion: w_i / sum(w_i)
        UD60x18 proportion = wi.div(total_w);

        // 3) Calculate the reward: R_i = (w_i / sum(w_i)) * R_pool
        UD60x18 reward = proportion.mul(reward_pool);

        // 4) Return the result divided by 1e18 using convert()
        return convert(reward);
    }
}

library PenaltyTokenFormulas {
    function calculatePenalty(
        uint256 di_raw,
        uint256 si_raw,
        uint256 dt_raw,
        uint256 dmax_raw,
        uint256 gamma_raw

    ) internal pure returns (uint256 penalty) {
        // 1) Wrap each raw “integer” into a UD60x18, scale up to 1e18 if neccessary
        UD60x18 gamma = ud(gamma_raw);
        UD60x18 di = ud(di_raw * 1e18);
        UD60x18 dt = ud(dt_raw * 1e18);
        UD60x18 dmax = ud(dmax_raw * 1e18);
        UD60x18 si = ud(si_raw * 1e18);

        // 2) Compute (d_i - D_T) and (D_max - D_T) as fixed-point numbers.
        UD60x18 numerator = di.sub(dt);
        UD60x18 denominator = dmax.sub(dt);

        // 3) Form the ratio = (d_i - D_T) / (D_max - D_T).
        UD60x18 ratio = numerator.div(denominator);

        // 4) Multiply γ * ratio * S_i in fixed point.
        UD60x18 intermediate = gamma.mul(ratio); // γ × ((d_i - D_T)/(D_max - D_T)) as UD60x18
        UD60x18 result = intermediate.mul(si);

        // 5) Return the result by dividing it by 1e18.
        penalty = convert(result);
    }

    function calculatePenaltyForModerator(
        uint256 di_raw,
        uint256 si_raw
    ) external pure returns (uint256) {
        return calculatePenalty(
            di_raw,
            si_raw,
            SystemConsts.MODERATION_REWARD_DEVIATION_THRESHOLD,
            SystemConsts.MODERATION_MAX_DEVIATION,
            SystemConsts.MODERATION_STAKE_PENALTY_RATE
        );
    }

    function calculatePenaltyForEvaluator(
        uint256 di_raw,
        uint256 si_raw
    ) external pure returns (uint256) {
        return calculatePenalty(
            di_raw,
            si_raw,
            SystemConsts.EVALUATION_REWARD_DEVIATION_THRESHOLD,
            SystemConsts.EVALUATION_MAX_DEVIATION,
            SystemConsts.EVALUATION_STAKE_PENALTY_RATE
        );
    }
}
