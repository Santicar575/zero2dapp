export const POOL_MANAGER_ABI = [
  {
    inputs: [
      {
        components: [
          { internalType: "Currency", name: "currency0", type: "address" },
          { internalType: "Currency", name: "currency1", type: "address" },
          { internalType: "uint24", name: "fee", type: "uint24" },
          { internalType: "int24", name: "tickSpacing", type: "int24" },
          { internalType: "contract IHooks", name: "hooks", type: "address" },
        ],
        internalType: "struct PoolKey",
        name: "key",
        type: "tuple",
      },
      {
        components: [
          { internalType: "bool", name: "zeroForOne", type: "bool" },
          { internalType: "int256", name: "amountSpecified", type: "int256" },
          { internalType: "uint160", name: "sqrtPriceLimitX96", type: "uint160" },
          { internalType: "bytes", name: "hookData", type: "bytes" },
        ],
        internalType: "struct IPoolManager.SwapParams",
        name: "params",
        type: "tuple",
      },
      { internalType: "bytes", name: "hookData", type: "bytes" },
    ],
    name: "swap",
    outputs: [
      { internalType: "BalanceDelta", name: "delta", type: "int256" },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "owner", type: "address" },
      { internalType: "Currency", name: "currency", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "take",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "Currency", name: "token", type: "address" },
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "settle",
    outputs: [{ internalType: "uint256", name: "paid", type: "uint256" }],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          { internalType: "Currency", name: "currency0", type: "address" },
          { internalType: "Currency", name: "currency1", type: "address" },
          { internalType: "uint24", name: "fee", type: "uint24" },
          { internalType: "int24", name: "tickSpacing", type: "int24" },
          { internalType: "contract IHooks", name: "hooks", type: "address" },
        ],
        internalType: "struct PoolKey",
        name: "key",
        type: "tuple",
      },
    ],
    name: "unlock",
    outputs: [{ internalType: "bytes", name: "result", type: "bytes" }],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;
