// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./Constants.sol";

library MathUtils {

    function mulConst(uint256 a, uint256 b) external pure returns (uint256) {
        return a * b / Weights.BASE_WEIGHT; 
    }

}