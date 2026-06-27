package com.parking.dto;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

@Data
public class MoveCarRequestCreateDTO {

    private Long requesterId;

    private String targetPlate;

    private Long targetSpaceId;

    private String reason;
}
