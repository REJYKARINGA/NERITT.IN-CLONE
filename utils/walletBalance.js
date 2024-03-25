async function walletBalance(userId){

    const wallet = await Wallet.findOne({ user: userId });
    if (wallet) {
      walletBalance = wallet.balance;
    }
}

module.exports = walletBalance