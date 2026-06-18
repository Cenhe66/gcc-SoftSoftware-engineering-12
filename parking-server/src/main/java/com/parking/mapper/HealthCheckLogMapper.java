package com.parking.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.parking.entity.HealthCheckLog;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

@Mapper
public interface HealthCheckLogMapper extends BaseMapper<HealthCheckLog> {

    @Select("SELECT * FROM health_check_log WHERE record_id = #{recordId} AND deleted = 0 ORDER BY create_time DESC")
    List<HealthCheckLog> selectByRecordId(@Param("recordId") Long recordId);

    @Select("SELECT * FROM health_check_log WHERE user_id = #{userId} AND deleted = 0 ORDER BY create_time DESC")
    List<HealthCheckLog> selectByUserId(@Param("userId") Long userId);

    @Select("SELECT * FROM health_check_log WHERE plate_number = #{plateNumber} AND deleted = 0 ORDER BY create_time DESC")
    List<HealthCheckLog> selectByPlateNumber(@Param("plateNumber") String plateNumber);

    @Select("SELECT * FROM health_check_log WHERE check_result = 1 AND is_notified = 0 AND deleted = 0")
    List<HealthCheckLog> selectUnnotifiedAbnormal();

    @Update("UPDATE health_check_log SET is_notified = 1 WHERE id = #{id}")
    int updateNotified(@Param("id") Long id);
}
