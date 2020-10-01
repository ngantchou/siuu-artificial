module.exports = {
    abi: [{
            "constant": false,
            "inputs": [{
                    "name": "token",
                    "type": "address"
                },
                {
                    "name": "_contributors",
                    "type": "address[]"
                },
                {
                    "name": "_balances",
                    "type": "uint256[]"
                }
            ],
            "name": "multisendToken",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [{
                "name": "newOwner",
                "type": "address"
            }],
            "name": "transferOwnership",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "anonymous": false,
            "inputs": [{
                    "indexed": false,
                    "name": "total",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "name": "tokenAddress",
                    "type": "address"
                }
            ],
            "name": "Multisended",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [{
                    "indexed": false,
                    "name": "previousOwner",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "name": "newOwner",
                    "type": "address"
                }
            ],
            "name": "OwnershipTransferred",
            "type": "event"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "owner",
            "outputs": [{
                "name": "",
                "type": "address"
            }],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [{
                "name": "customer",
                "type": "address"
            }],
            "name": "txCount",
            "outputs": [{
                "name": "",
                "type": "uint256"
            }],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        }
    ],
    address: "0xb46fbdb2ebf9370fa88418e7d69c11d07d0cb451",
    apKey: "siud6fbdb2ebf9370fa88418e7d69c11d07d0cb451drop"
};