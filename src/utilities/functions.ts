export function getCoinGeckoId(tokenSymbol: string) {
  switch (tokenSymbol) {
    case 'ETH':
      return 'ethereum';
    case 'DAI':
      return 'dai';
    case 'USDC':
      return 'usd-coin';
    case 'WETH':
      return 'weth';
  }
}