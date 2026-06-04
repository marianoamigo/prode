package com.prode.worldcup.domain.model;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class PrivateGroupModel {
    private UUID id;

    private String name;

    private String inviteCode;

    private UserModel owner;

    private List<UserModel> users;

    private LocalDateTime createdAt;
}
