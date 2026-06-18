package com.parking.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.parking.entity.ParkingRecord;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

@Mapper
public interface ParkingRecordMapper extends BaseMapper<ParkingRecord> {

    @Select("SELECT * FROM parking_record WHERE plate_number = #{plateNumber} AND record_status = 0 AND deleted = 0 ORDER BY entry_time DESC LIMIT 1")
    ParkingRecord selectOngoingByPlate(@Param("plateNumber") String plateNumber);

    @Select("SELECT * FROM parking_record WHERE user_id = #{userId} AND deleted = 0 ORDER BY entry_time DESC")
    List<ParkingRecord> selectByUserId(@Param("userId") Long userId);

    @Update("UPDATE parking_record SET exit_time = #{exitTime}, duration_minutes = #{durationMinutes}, fee = #{fee}, record_status = 1 WHERE id = #{id}")
    int updateOnExit(@Param("id") Long id, @Param("exitTime") java.time.LocalDateTime exitTime,
                     @Param("durationMinutes") Integer durationMinutes, @Param("fee") java.math.BigDecimal fee);

    @Select("SELECT * FROM parking_record WHERE lot_id = #{lotId} AND record_status = 0 AND deleted = 0")
    List<ParkingRecord> selectOngoingByLotId(@Param("lotId") Long lotId);
}
