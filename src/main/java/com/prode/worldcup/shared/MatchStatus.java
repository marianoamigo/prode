package com.prode.worldcup.shared;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum MatchStatus {
    SCHEDULED,
    LIVE,
    FINISHED
}
