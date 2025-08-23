import * as Model from "../models";
import { SubscriptionPlan } from "../models/subscriptionPlan.model";

class RepositoryService {
  static users: Model.User[] = [];
  static albums: Model.Album[] = [];
  static genres: Model.Genre[] = [];
  static tracks: Model.Track[] = [];
  static artists: Model.Artist[] = [];
  static listeners: Model.Listener[] = [];
  static subscriptions: Model.Subscription[] = []; // Add subscription storage
  static subscriptionPlans: SubscriptionPlan[] = []; // Add subscription plans storage
  static config: Model.Config | null = null;
}

export { RepositoryService };
