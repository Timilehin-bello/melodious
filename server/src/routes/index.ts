import express, { Router } from "express";
import authRoute from "./auth.route";
import userRoute from "./user.route";
import transactionRoute from "./transaction.route";
import subscriptionRoute from "./subscription.route";

const router: Router = express.Router();

interface IRoute {
  path: string;
  route: Router;
}

const defaultRoutes: IRoute[] = [
  {
    path: "/auth",
    route: authRoute,
  },
  {
    path: "/users",
    route: userRoute,
  },
  {
    path: "/tracks",
    route: userRoute,
  },
  {
    path: "/transactions",
    route: transactionRoute,
  },
  {
    path: "/subscriptions",
    route: subscriptionRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
