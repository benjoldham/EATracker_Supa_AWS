import { defineAuth } from "@aws-amplify/backend";

export const auth = defineAuth({
  loginWith: {
    email: true,
  },
  // Required for signInWithRedirect() / hosted login
  redirectUrls: {
    callbackUrls: [
      "https://main.d1qq9xnqrsdy22.amplifyapp.com/aws-test.html",
    ],
    logoutUrls: [
      "https://main.d1qq9xnqrsdy22.amplifyapp.com/aws-test.html",
    ],
  },
});
