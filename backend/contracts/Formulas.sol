// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./Constants.sol";
import {UD60x18, ud, convert, pow, exp, intoUint256} from "@prb/math/src/UD60x18.sol";

library ModerationRewardTokenFormulas {
    function calculateWeight(
        uint256 di_raw,
        uint256 si_raw
    ) external pure returns (uint256) {
        // 1) Convert the constants to UD60x18 format
        UD60x18 alpha = ud(SystemConsts.REWARD_DISTRIBUTION_SPREAD);
        UD60x18 beta = ud(SystemConsts.STAKE_INFLUENCE_COEFFICIENT);
        
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


    function calculateRewardForEachModerator(
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

library ModerationPenaltyTokenFormulas {
    function calculatePenalty(
        uint256 di_raw,
        uint256 si_raw
    ) external pure returns (uint256 penalty) {
        // 1) Wrap each raw “integer” into a UD60x18, scale up to 1e18 if neccessary
        UD60x18 gamma = ud(SystemConsts.STAKE_PENALTY_RATE);
        UD60x18 di = ud(di_raw * 1e18);
        UD60x18 dt = ud(SystemConsts.REWARD_DEVIATION_THRESHOLD * 1e18);
        UD60x18 dmax = ud(SystemConsts.MAX_DEVIATION * 1e18);
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
}
