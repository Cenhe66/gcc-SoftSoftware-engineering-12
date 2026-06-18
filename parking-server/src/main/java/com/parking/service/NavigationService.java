package com.parking.service;

import com.parking.vo.NavigationVO;

import java.math.BigDecimal;

public interface NavigationService {

    NavigationVO navigateToSpace(Long spaceId, BigDecimal currentX, BigDecimal currentY);
}
