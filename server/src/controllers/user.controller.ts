import httpStatus from "http-status";
import { userService } from "../services";
import catchAsync from "../utils/catchAsync";

const checkIfUserAlreadyExists = catchAsync(async (req: any, res: any) => {
  const user = await userService.getUserByUniqueValue(
    {
      walletAddress: req.query.walletAddress.toLowerCase(),
    },
    {
      listener: true,
      artist: true,
    }
  );

  if (!user) {
    res.status(httpStatus.OK).send({
      status: "success",
      message: "User not found",
      data: false,
    });
    return;
  }

  res.status(httpStatus.OK).send({
    status: "success",
    message: "User found",
    data: true,
  });
});

export { checkIfUserAlreadyExists };
