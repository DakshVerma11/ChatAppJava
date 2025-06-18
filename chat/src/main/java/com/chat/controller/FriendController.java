package com.chat.controller;

import com.chat.entity.Friend;
import com.chat.entity.User;
import com.chat.repository.FriendRepository;
import com.chat.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
public class FriendController {

    @Autowired
    private UserRepository userRepo;
    @Autowired
    private FriendRepository friendRepo;

    @PostMapping("/add-friend")
    public ResponseEntity<?> addFriend(
            @AuthenticationPrincipal UserDetails principal,
            @RequestParam String username
    ) {
        Map<String, Object> resp = new HashMap<>();
        if (principal == null) {
            resp.put("success", false);
            resp.put("message", "Not authenticated.");
            return ResponseEntity.status(401).body(resp);
        }
        Optional<User> userOpt = userRepo.findByUsername(principal.getUsername());
        Optional<User> friendOpt = userRepo.findByUsername(username);
        if (userOpt.isEmpty()) {
            resp.put("success", false);
            resp.put("message", "User not found.");
        } else if (friendOpt.isEmpty()) {
            resp.put("success", false);
            resp.put("message", "No such username.");
        } else if (userOpt.get().getUsername().equals(username)) {
            resp.put("success", false);
            resp.put("message", "Cannot add yourself.");
        } else if (friendRepo.findFriendIdsByUserId(userOpt.get().getUserId()).contains(friendOpt.get().getUserId())) {
            resp.put("success", false);
            resp.put("message", "Already friends.");
        } else {
            // Add to friends table
            Friend friend = new Friend();
            friend.setUserId(userOpt.get().getUserId());
            friend.setFriendId(friendOpt.get().getUserId());
            friend.setCreatedAt(LocalDateTime.now());
            friendRepo.save(friend);
            resp.put("success", true);
        }
        return ResponseEntity.ok(resp);
    }
}