import type { User } from "@/types/user";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { UserPlus } from "lucide-react";
import { DialogFooter } from "../ui/dialog";

interface SearchResultListProps {
  users: User[];
  onSelect: (user: User) => void;
  onBack: () => void;
}

const SearchResultList = ({ users, onSelect, onBack }: SearchResultListProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2 max-h-[250px] overflow-y-auto beautiful-scrollbar">
        {users.map((user) => (
          <div
            key={user._id}
            className="flex items-center justify-between p-2 rounded-lg glass hover:bg-sidebar-accent transition-smooth"
          >
            <div className="flex items-center gap-3">
              <Avatar className="size-10 border-2 border-primary/20">
                <AvatarImage src={user.avatarUrl || undefined} />
                <AvatarFallback className="bg-gradient-primary text-white">
                  {user.displayName?.charAt(0).toUpperCase() || user.username?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-semibold">{user.displayName}</span>
                <span className="text-xs text-muted-foreground">@{user.username}</span>
              </div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="hover:bg-primary hover:text-white"
              onClick={() => onSelect(user)}
            >
              <UserPlus className="size-4 mr-1" />
              Thêm
            </Button>
          </div>
        ))}
      </div>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          className="flex-1 glass hover:text-destructive"
          onClick={onBack}
        >
          Quay lại
        </Button>
      </DialogFooter>
    </div>
  );
};

export default SearchResultList;
