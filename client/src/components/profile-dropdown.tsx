import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User, Settings, LogOut, Camera, ChevronDown, Check, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { getUserDisplayName, getUserInitials } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export const AVATAR_RINGS = [
  { id: "none", label: "None", className: "" },
  { id: "pulse-cyan", label: "Pulse Cyan", className: "animate-pulse ring-2 ring-cyan-400" },
  { id: "pulse-purple", label: "Pulse Purple", className: "animate-pulse ring-2 ring-purple-400" },
  { id: "glow-gold", label: "Glow Gold", className: "ring-2 ring-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.6)]" },
  { id: "glow-green", label: "Glow Green", className: "ring-2 ring-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" },
  { id: "glow-pink", label: "Glow Pink", className: "ring-2 ring-pink-400 shadow-[0_0_8px_rgba(244,114,182,0.6)]" },
  { id: "rainbow", label: "Rainbow", className: "ring-2 ring-transparent bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 bg-clip-border" },
  { id: "fire", label: "Fire", className: "ring-2 ring-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.7)] animate-pulse" },
  { id: "ice", label: "Ice", className: "ring-2 ring-sky-300 shadow-[0_0_10px_rgba(125,211,252,0.6)]" },
] as const;

export const FLAIR_BADGES = [
  { id: "none", label: "None", icon: null },
  { id: "crown", label: "Crown", icon: "crown" },
  { id: "star", label: "Star", icon: "star" },
  { id: "lightning", label: "Lightning", icon: "lightning" },
  { id: "heart", label: "Heart", icon: "heart" },
  { id: "diamond", label: "Diamond", icon: "diamond" },
  { id: "cat", label: "Cat", icon: "cat" },
  { id: "dog", label: "Dog", icon: "dog" },
  { id: "bear", label: "Bear", icon: "bear" },
  { id: "fox", label: "Fox", icon: "fox" },
  { id: "wolf", label: "Wolf", icon: "wolf" },
  { id: "panda", label: "Panda", icon: "panda" },
] as const;

export function getAvatarRingClass(ringId: string | null | undefined): string {
  if (!ringId || ringId === "none") return "";
  const ring = AVATAR_RINGS.find(r => r.id === ringId);
  return ring?.className || "";
}

export function getFlairIcon(badgeId: string | null | undefined): string | null {
  if (!badgeId || badgeId === "none") return null;
  const badge = FLAIR_BADGES.find(b => b.id === badgeId);
  return badge?.icon || null;
}

const FLAIR_ICON_MAP: Record<string, string> = {
  crown: "\u{1F451}",
  star: "\u2B50",
  lightning: "\u26A1",
  heart: "\u2764\uFE0F",
  diamond: "\u{1F48E}",
  cat: "\u{1F431}",
  dog: "\u{1F436}",
  bear: "\u{1F43B}",
  fox: "\u{1F98A}",
  wolf: "\u{1F43A}",
  panda: "\u{1F43C}",
};

export function FlairBadgeDisplay({ badgeId, className }: { badgeId: string | null | undefined; className?: string }) {
  const icon = getFlairIcon(badgeId);
  if (!icon) return null;
  const emoji = FLAIR_ICON_MAP[icon];
  if (!emoji) return null;
  return (
    <span className={`text-xs ${className || ""}`} data-testid="flair-badge-display">{emoji}</span>
  );
}

export function ProfileDropdown() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [editOpen, setEditOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [selectedRing, setSelectedRing] = useState<string>("none");
  const [selectedFlair, setSelectedFlair] = useState<string>("none");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { displayName?: string; bio?: string }) => {
      const res = await apiRequest("PATCH", `/api/users/${user?.id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setEditOpen(false);
      toast({ title: "Profile updated" });
    },
  });

  const saveDecorationsMutation = useMutation({
    mutationFn: async (data: { avatarRing?: string; flairBadge?: string }) => {
      const res = await apiRequest("PATCH", `/api/users/${user?.id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setSettingsOpen(false);
      toast({ title: "Settings saved" });
    },
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("avatar", file);
      const res = await fetch("/api/upload/avatar", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Upload failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({ title: "Avatar updated" });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadAvatarMutation.mutate(file);
    }
  };

  const handleOpenEdit = () => {
    setDisplayName(user?.displayName || getUserDisplayName(user));
    setBio(user?.bio || "");
    setEditOpen(true);
  };

  const handleOpenSettings = () => {
    setSelectedRing(user?.avatarRing || "none");
    setSelectedFlair(user?.flairBadge || "none");
    setSettingsOpen(true);
  };

  const handleSaveDecorations = () => {
    saveDecorationsMutation.mutate({
      avatarRing: selectedRing,
      flairBadge: selectedFlair,
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2 px-2" data-testid="button-profile-dropdown">
            <Avatar className="w-8 h-8">
              <AvatarImage src={user?.profileImageUrl || undefined} />
              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                {getUserInitials(user)}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium hidden sm:inline truncate max-w-24" data-testid="text-current-user">
              {getUserDisplayName(user)}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground hidden sm:block" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={handleOpenEdit} data-testid="menu-edit-profile">
            <User className="w-4 h-4 mr-2" />
            Edit Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => fileInputRef.current?.click()} data-testid="menu-upload-avatar">
            <Camera className="w-4 h-4 mr-2" />
            Change Avatar
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleOpenSettings} data-testid="menu-settings">
            <Sparkles className="w-4 h-4 mr-2" />
            Decorations
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => logout()}
            className="text-destructive focus:text-destructive"
            data-testid="menu-logout"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-sm" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="relative">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={user?.profileImageUrl || undefined} />
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                    {getUserInitials(user)}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="w-3 h-3" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter display name"
                data-testid="input-display-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Input
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell others about yourself..."
                maxLength={150}
                data-testid="input-bio"
              />
              <p className="text-xs text-muted-foreground text-right">{bio.length}/150</p>
            </div>
            <Button
              className="w-full"
              onClick={() => updateProfileMutation.mutate({ displayName, bio })}
              disabled={updateProfileMutation.isPending}
              data-testid="button-save-profile"
            >
              {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Profile Decorations</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-6 pr-4">
              <div className="space-y-3">
                <Label className="text-sm font-medium">Avatar Ring</Label>
                <div className="flex justify-center mb-3">
                  <div className={`rounded-full p-0.5 ${getAvatarRingClass(selectedRing)}`}>
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={user?.profileImageUrl || undefined} />
                      <AvatarFallback className="text-xl bg-primary/10 text-primary">
                        {getUserInitials(user)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  {selectedFlair !== "none" && (
                    <FlairBadgeDisplay badgeId={selectedFlair} className="text-lg ml-1 -mt-1" />
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {AVATAR_RINGS.map((ring) => (
                    <button
                      key={ring.id}
                      onClick={() => setSelectedRing(ring.id)}
                      className={`relative flex items-center gap-2 p-2 rounded-md border text-xs transition-colors
                        ${selectedRing === ring.id
                          ? "border-primary bg-primary/10"
                          : "border-border hover-elevate"
                        }`}
                      data-testid={`ring-option-${ring.id}`}
                    >
                      {ring.id !== "none" && (
                        <span className={`w-4 h-4 rounded-full ${ring.className}`} />
                      )}
                      <span className="truncate">{ring.label}</span>
                      {selectedRing === ring.id && (
                        <Check className="w-3 h-3 text-primary absolute top-1 right-1" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">Flair Badge</Label>
                <div className="grid grid-cols-3 gap-2">
                  {FLAIR_BADGES.map((badge) => (
                    <button
                      key={badge.id}
                      onClick={() => setSelectedFlair(badge.id)}
                      className={`relative flex items-center gap-2 p-2 rounded-md border text-xs transition-colors
                        ${selectedFlair === badge.id
                          ? "border-primary bg-primary/10"
                          : "border-border hover-elevate"
                        }`}
                      data-testid={`flair-option-${badge.id}`}
                    >
                      {badge.icon && (
                        <span className="text-sm">{FLAIR_ICON_MAP[badge.icon]}</span>
                      )}
                      <span className="truncate">{badge.label}</span>
                      {selectedFlair === badge.id && (
                        <Check className="w-3 h-3 text-primary absolute top-1 right-1" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
          <Button
            className="w-full mt-2"
            onClick={handleSaveDecorations}
            disabled={saveDecorationsMutation.isPending}
            data-testid="button-save-decorations"
          >
            {saveDecorationsMutation.isPending ? "Saving..." : "Save Decorations"}
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
