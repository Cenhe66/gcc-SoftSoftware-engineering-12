package com.parking.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.parking.entity.ParkingRecord;
import com.parking.vo.ParkingRecordVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;
import java.util.Map;

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

    @Select("SELECT * FROM parking_record WHERE space_id = #{spaceId} AND record_status = 0 AND deleted = 0 ORDER BY entry_time DESC LIMIT 1")
    ParkingRecord selectOngoingBySpaceId(@Param("spaceId") Long spaceId);

    /**
     * 查询用户停车记录列表（包含关联的停车场和车位信息）
     */
    @Select("SELECT pr.*, " +
            "pl.name AS parking_name, pl.address AS parking_address, pl.hourly_rate, " +
            "ps.space_no AS space_code, ps.floor " +
            "FROM parking_record pr " +
            "LEFT JOIN parking_lot pl ON pr.lot_id = pl.id " +
            "LEFT JOIN parking_space ps ON pr.space_id = ps.id " +
            "WHERE pr.user_id = #{userId} AND pr.deleted = 0 " +
            "ORDER BY pr.entry_time DESC")
    List<ParkingRecordVO> selectVOByUserId(@Param("userId") Long userId);

    com.baomidou.mybatisplus.core.metadata.IPage<ParkingRecordVO> selectVOPage(
            com.baomidou.mybatisplus.core.metadata.IPage<ParkingRecordVO> page,
            @Param("plateNumber") String plateNumber,
            @Param("recordStatus") Integer recordStatus,
            @Param("entryStart") String entryStart,
            @Param("entryEnd") String entryEnd);

    /**
     * 查询最近N天每日收益趋势
     */
    @Select("SELECT DATE(exit_time) as date, COALESCE(SUM(fee), 0) as revenue " +
            "FROM parking_record " +
            "WHERE record_status = 1 AND deleted = 0 AND exit_time >= #{startDate} " +
            "GROUP BY DATE(exit_time) " +
            "ORDER BY date")
    List<Map<String, Object>> selectRevenueTrend(@Param("startDate") java.time.LocalDateTime startDate);
}
