
/*
  This file is auto-generated.
  Command: 'npm run genabi'
*/
export const EncryptedTemperatureCheckABI = {
  "abi": [
    {
      "inputs": [],
      "name": "getFeverResult",
      "outputs": [
        {
          "internalType": "ebool",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getTemperature",
      "outputs": [
        {
          "internalType": "euint32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "protocolId",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "externalEuint32",
          "name": "encryptedTemperature",
          "type": "bytes32"
        },
        {
          "internalType": "externalEuint32",
          "name": "encryptedThreshold",
          "type": "bytes32"
        },
        {
          "internalType": "bytes",
          "name": "inputProof",
          "type": "bytes"
        },
        {
          "internalType": "bytes",
          "name": "thresholdProof",
          "type": "bytes"
        }
      ],
      "name": "submitAndCheck",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]
} as const;

