package com.parking.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.parking.entity.ParkingSpace;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

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
}
