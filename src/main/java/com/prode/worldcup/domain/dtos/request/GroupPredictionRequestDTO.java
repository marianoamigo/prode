package com.prode.worldcup.domain.dtos.request;


import java.util.UUID;

public record GroupPredictionRequestDTO (

    UUID teamId,

    Integer position){
}
