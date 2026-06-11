package com.prode.worldcup.domain.dtos.external;

import com.fasterxml.jackson.annotation.JsonProperty;

public record ExternalTeam(
        @JsonProperty("id") String id,
        @JsonProperty("name_en") String nameEn,
        @JsonProperty("fifa_code") String fifaCode
) {}
