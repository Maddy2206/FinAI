/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as assistant from "../assistant.js";
import type * as assistantActions from "../assistantActions.js";
import type * as budgets from "../budgets.js";
import type * as expenses from "../expenses.js";
import type * as insights from "../insights.js";
import type * as nlp from "../nlp.js";
import type * as receiptActions from "../receiptActions.js";
import type * as receipts from "../receipts.js";
import type * as reports from "../reports.js";
import type * as reportsActions from "../reportsActions.js";
import type * as scheduler from "../scheduler.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  assistant: typeof assistant;
  assistantActions: typeof assistantActions;
  budgets: typeof budgets;
  expenses: typeof expenses;
  insights: typeof insights;
  nlp: typeof nlp;
  receiptActions: typeof receiptActions;
  receipts: typeof receipts;
  reports: typeof reports;
  reportsActions: typeof reportsActions;
  scheduler: typeof scheduler;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
