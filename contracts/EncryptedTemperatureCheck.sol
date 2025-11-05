// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint32, externalEuint32, ebool} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Encrypted Temperature Check Contract
/// @author Encrypted Temperature Check System
/// @notice A contract that allows users to submit encrypted temperature readings
///         and checks if the temperature indicates fever (>= 37.5°C) in encrypted state
/// @dev This contract uses FHEVM for homomorphic encryption operations
contract EncryptedTemperatureCheck is SepoliaConfig {
    /// @notice Encrypted temperature reading stored as euint32 (value in tenths of degrees)
    euint32 private _temperature;

    /// @notice Encrypted fever check result (true = fever >= 37.5°C, false = normal)
    ebool private _hasFever;

    /// @notice Fever threshold: 37.5°C (stored as 375 to represent 37.5 in tenths)
    uint32 private constant FEVER_THRESHOLD = 375;

    /// @notice Returns the current encrypted temperature reading
    /// @return The current encrypted temperature (in tenths of degrees Celsius)
    function getTemperature() external view returns (euint32) {
        return _temperature;
    }

    /// @notice Returns the encrypted fever check result
    /// @return The encrypted fever result (true = fever >= 37.5°C, false = normal)
    function getFeverResult() external view returns (ebool) {
        return _hasFever;
    }

    /// @notice Submit temperature and check fever using encrypted threshold comparison
    /// @param encryptedTemperature The encrypted temperature value (in tenths of degrees, e.g., 375 = 37.5°C)
    /// @param encryptedThreshold The encrypted threshold value (375 = 37.5°C)
    /// @param inputProof The input proof for the encrypted temperature
    /// @param thresholdProof The input proof for the encrypted threshold
    function submitAndCheck(
        externalEuint32 encryptedTemperature,
        externalEuint32 encryptedThreshold,
        bytes calldata inputProof,
        bytes calldata thresholdProof
    ) external {
        // Convert external encrypted values to internal
        euint32 temperature = FHE.fromExternal(encryptedTemperature, inputProof);
        euint32 threshold = FHE.fromExternal(encryptedThreshold, thresholdProof);

        // Store the temperature
        _temperature = temperature;

        // Compare: temperature >= threshold (fever check)
        // FHE.ge() returns ebool (encrypted boolean)
        _hasFever = FHE.ge(temperature, threshold);

        // Allow decryption of results
        FHE.allowThis(_temperature);
        FHE.allow(_temperature, msg.sender);
        FHE.allowThis(_hasFever);
        FHE.allow(_hasFever, msg.sender);
    }
}


// Add input validation and error handling

// Add owner-only functions and access modifiers

// Reduce computational complexity and gas costs

// Implement encrypted temperature history storage
