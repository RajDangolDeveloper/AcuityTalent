import { toast } from "react-toastify";

type ToastStatusType = "success" | "error" | "default";

type NotifyProps = {
  toastMessage: string;
  toastStatus: ToastStatusType;
};

const Notification = (props: NotifyProps) => {
  const { toastMessage, toastStatus } = props;
  switch (toastStatus) {
    case "success":
      toast.success(toastMessage, { autoClose: 1000 });
      break;
    case "error":
      toast.error(toastMessage);
      break;
    default:
      toast(toastMessage);
  }
};

export default Notification;
