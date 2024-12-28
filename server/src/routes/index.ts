import express, { Router } from "express";
import authRoute from "./auth.route";
import transactionRoute from "./transaction.route";

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
    path: "/transactions",
    route: transactionRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
