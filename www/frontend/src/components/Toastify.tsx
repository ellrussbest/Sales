import { FC, ReactNode, useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

enum MESSAGE {
  ERROR = "Request Unsuccessful",
  SUCCESS = "Transaction Successful",
}

export const Toastify: FC<{
  isLoading: boolean;
  error: any;
  data: any;
  clearError: () => void;
  //   message: string;
  children: (callback: () => void) => ReactNode;
}> = ({ children, isLoading, error, data, clearError }) => {
  const [val, setVal] = useState(0);
  const [message, setMessage] = useState("");

  const handleClick = () => setVal((val) => val + 1);

  useEffect(() => {
    !isLoading && error && setMessage(MESSAGE.ERROR);
    !isLoading && !error && data && setMessage(MESSAGE.SUCCESS);

    return () => {
      error && clearError();
    };
  }, [message, isLoading, error, clearError, data]);

  useEffect(() => {
    message && toast(message);
  }, [message, val]);

  return (
    <div>
      {children(handleClick)}
      <ToastContainer theme="colored" autoClose={1000} />
    </div>
  );
};
