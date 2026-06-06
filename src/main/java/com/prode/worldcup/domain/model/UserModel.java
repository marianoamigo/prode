package com.prode.worldcup.domain.model;

import com.prode.worldcup.services.group.PrivateGroupService;
import com.prode.worldcup.shared.Role;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
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
    private Integer totalPoints;
    private List<PrivateGroupModel> groups;
    private String pictureUrl;
}
