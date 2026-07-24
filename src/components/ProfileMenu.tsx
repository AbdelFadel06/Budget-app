import { useEffect, useRef, useState } from "react";
import { View, Text, Pressable, Modal, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";

interface ProfileMenuProps {
  onSignOut: () => void;
}

interface Anchor {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function ProfileMenu({ onSignOut }: ProfileMenuProps) {
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const avatarRef = useRef<View>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
    });
  }, []);

  function handleOpen() {
    avatarRef.current?.measureInWindow((x, y, width, height) => {
      setAnchor({ x, y, width, height });
      setOpen(true);
    });
  }

  return (
    <>
      <View ref={avatarRef} collapsable={false}>
        <Pressable style={styles.avatar} onPress={handleOpen}>
          <Ionicons name="person" size={20} color="#fff" />
        </Pressable>
      </View>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          {anchor && (
            <View
              style={[
                styles.bubbleWrap,
                { top: anchor.y + anchor.height + 10, left: anchor.x },
              ]}
            >
              <View style={styles.tail} />
              <View style={styles.bubble}>
                {email && (
                  <>
                    <View style={styles.emailRow}>
                      <Text style={styles.emailText} numberOfLines={1}>
                        {email}
                      </Text>
                    </View>
                    <View style={styles.divider} />
                  </>
                )}
                <Pressable
                  style={styles.menuItem}
                  onPress={() => {
                    setOpen(false);
                    onSignOut();
                  }}
                >
                  <Ionicons name="log-out-outline" size={18} color="#ef4444" />
                  <Text style={styles.menuItemText}>Se déconnecter</Text>
                </Pressable>
              </View>
            </View>
          )}
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  backdrop: {
    flex: 1,
  },
  bubbleWrap: {
    position: "absolute",
  },
  tail: {
    width: 14,
    height: 14,
    backgroundColor: "#fff",
    marginLeft: 14,
    marginBottom: -7,
    borderTopLeftRadius: 3,
    transform: [{ rotate: "45deg" }],
  },
  bubble: {
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingVertical: 4,
    minWidth: 180,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuItemText: { color: "#ef4444", fontWeight: "600" },
  emailRow: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
  },
  emailText: {
    color: "#6b7280",
    fontSize: 12,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "#f3f4f6",
  },
});
