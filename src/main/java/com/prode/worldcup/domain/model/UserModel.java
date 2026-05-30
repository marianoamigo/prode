package com.prode.worldcup.domain.model;

import com.prode.worldcup.shared.Role;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class UserModel {
    private UUID id; //UUID
    private String googleId;
    private String email;
    private String name;
    private Role role;
    private LocalDateTime createdAt;
}
