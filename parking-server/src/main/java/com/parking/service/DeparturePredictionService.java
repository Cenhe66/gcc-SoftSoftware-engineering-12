package com.parking.service;

import com.parking.vo.DeparturePredictionVO;

import java.util.List;

public interface DeparturePredictionService {

    DeparturePredictionVO predictByRecordId(Long recordId);

    List<DeparturePredictionVO> predictByLotId(Long lotId);
}
