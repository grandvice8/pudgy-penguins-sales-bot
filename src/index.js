require("dotenv").config();

const { postTweet } = require("./twitter-bot/twitter");

async function main() {
  try {
    // Post tweet after making async call to get penguin sales. Example below
    // await postTweet("1234", "3.2").then(() => {
    //   console.log("Tweet succeeded");
    // });
  } catch (e) {
    console.log(`Tweet failed ${e}`);
  }
}

// setInterval(main, 10000);