package com.parking.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.parking.entity.ParkingSpace;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;
import java.util.Map;

@Mapper
public interface ParkingSpaceMapper extends BaseMapper<ParkingSpace> {

    @Select("SELECT * FROM parking_space WHERE lot_id = #{lotId} AND deleted = 0")
    List<ParkingSpace> selectByLotId(@Param("lotId") Long lotId);

    @Select("SELECT * FROM parking_space WHERE lot_id = #{lotId} AND status = #{status} AND deleted = 0")
    List<ParkingSpace> selectByLotIdAndStatus(@Param("lotId") Long lotId, @Param("status") Integer status);

    @Update("UPDATE parking_space SET status = #{status} WHERE id = #{id}")
    int updateStatus(@Param("id") Long id, @Param("status") Integer status);

    @Update("UPDATE parking_space SET lock_status = #{lockStatus} WHERE id = #{id}")
    int updateLockStatus(@Param("id") Long id, @Param("lockStatus") Integer lockStatus);

    @Select("SELECT * FROM parking_space WHERE lot_id = #{lotId} AND space_no = #{spaceNo} AND deleted = 0 LIMIT 1")
    ParkingSpace selectByLotIdAndSpaceNo(@Param("lotId") Long lotId, @Param("spaceNo") String spaceNo);

    @Select("SELECT lot_id as lotId, COUNT(*) as total, SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as occupied FROM parking_space WHERE deleted = 0 GROUP BY lot_id")
    List<Map<String, Object>> selectSpaceStatsGroupByLot();

    @Select("SELECT COUNT(*) as total, SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as occupied FROM parking_space WHERE lot_id = #{lotId} AND deleted = 0")
    Map<String, Object> selectSpaceStatsByLotId(@Param("lotId") Long lotId);

    @Select("SELECT * FROM parking_space WHERE owner_id = #{ownerId} AND deleted = 0")
    List<ParkingSpace> selectByOwnerId(@Param("ownerId") Long ownerId);
}
