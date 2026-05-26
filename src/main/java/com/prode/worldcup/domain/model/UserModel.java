package com.prode.worldcup.domain.model;

import com.prode.worldcup.shared.Role;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class UserModel {
    private String id; //UUID
    private String googleId;
    private String email;
    private String name;
    private Role role;
    private LocalDateTime createdAt;
}
