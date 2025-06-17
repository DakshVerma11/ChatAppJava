package com.chat.entity;


import java.io.Serializable;
import java.util.Objects;

public class FriendId implements Serializable {
    private Long userId;
    private Long friendId;

    public FriendId() {}

    public FriendId(Long userId, Long friendId) {
        this.userId = userId;
        this.friendId = friendId;
    }

    // getters & setters

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof FriendId)) return false;
        FriendId that = (FriendId) o;
        return Objects.equals(userId, that.userId)
            && Objects.equals(friendId, that.friendId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userId, friendId);
    }
}