import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { UserPlus } from "lucide-react";
import type { User } from "@/types/user";
import { useFriendStore } from "@/stores/useFriendStore";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import SearchForm from "@/components/AddFriendModal/SearchForm";
import SearchResultList from "@/components/AddFriendModal/SearchResultList";
import SendFriendRequestForm from "@/components/AddFriendModal/SendFriendRequestForm";

export interface IFormValues {
  username: string;
  message: string;
}

type Step = "search" | "list" | "send";

const AddFriendModal = () => {
  const [step, setStep] = useState<Step>("search");
  const [isFound, setIsFound] = useState<boolean | null>(null);
  const [searchUsers, setSearchUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User>();
  const [searchedUsername, setSearchedUsername] = useState("");
  const { loading, searchByUsername, addFriend } = useFriendStore();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<IFormValues>({
    defaultValues: { username: "", message: "" },
  });

  const usernameValue = watch("username");

  const handleSearch = handleSubmit(async (data) => {
    const username = data.username.trim();
    if (!username) return;

    setIsFound(null);
    setSearchedUsername(username);

    try {
      const foundUsers = await searchByUsername(username);
      if (foundUsers && foundUsers.length > 0) {
        setIsFound(true);
        setSearchUsers(foundUsers);
        setStep("list");
      } else {
        setIsFound(false);
      }
    } catch (error) {
      console.error(error);
      setIsFound(false);
    }
  });

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setStep("send");
  };

  const handleSend = handleSubmit(async (data) => {
    if (!selectedUser) return;

    try {
      const message = await addFriend(selectedUser._id, data.message.trim());
      toast.success(message);

      handleCancel();
    } catch (error) {
      console.error("Lỗi xảy ra khi gửi request từ form", error);
    }
  });

  const handleCancel = () => {
    reset();
    setSearchedUsername("");
    setIsFound(null);
    setSearchUsers([]);
    setSelectedUser(undefined);
    setStep("search");
  };

  return (
    <Dialog onOpenChange={(open) => { if (!open) handleCancel(); }}>
      <DialogTrigger asChild>
        <div className="flex justify-center items-center size-5 rounded-full hover:bg-sidebar-accent cursor-pointer z-10">
          <UserPlus className="size-4" />
          <span className="sr-only">Kết bạn</span>
        </div>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px] border-none">
        <DialogHeader>
          <DialogTitle>
            {step === "search" && "Kết Bạn"}
            {step === "list" && "Kết quả tìm kiếm"}
            {step === "send" && "Gửi Lời Mời"}
          </DialogTitle>
        </DialogHeader>

        {step === "search" && (
          <SearchForm
            register={register}
            errors={errors}
            usernameValue={usernameValue}
            loading={loading}
            isFound={isFound}
            searchedUsername={searchedUsername}
            onSubmit={handleSearch}
            onCancel={handleCancel}
          />
        )}

        {step === "list" && (
          <SearchResultList
            users={searchUsers}
            onSelect={handleSelectUser}
            onBack={() => setStep("search")}
          />
        )}

        {step === "send" && selectedUser && (
          <SendFriendRequestForm
            register={register}
            loading={loading}
            searchedUsername={selectedUser.username}
            onSubmit={handleSend}
            onBack={() => setStep("list")}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddFriendModal;
