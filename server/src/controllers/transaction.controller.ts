import { Request, Response } from "express";
import catchAsync from "../utils/catchAsync";
import { transactionService } from "../services";
import httpStatus from "http-status";

const sendTransactionRequest = catchAsync(
  async (req: Request, res: Response) => {
    // Call the transactionService to send a transaction
    const txStatus = await transactionService.addTransactionRequest(req.body);

    // Return the transaction status
    res
      .status(httpStatus.OK)
      .send({ status: "success", message: txStatus, data: req.body });
  }
);

export { sendTransactionRequest };
