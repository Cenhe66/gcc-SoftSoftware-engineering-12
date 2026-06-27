package com.parking.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.parking.entity.MoveCarRequest;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

@Mapper
public interface MoveCarRequestMapper extends BaseMapper<MoveCarRequest> {

    @Select("SELECT * FROM move_car_request WHERE requester_id = #{requesterId} AND deleted = 0 ORDER BY create_time DESC")
    List<MoveCarRequest> selectByRequesterId(@Param("requesterId") Long requesterId);

    @Select("SELECT * FROM move_car_request WHERE target_plate = #{targetPlate} AND deleted = 0 ORDER BY create_time DESC")
    List<MoveCarRequest> selectByTargetPlate(@Param("targetPlate") String targetPlate);

    @Select("SELECT * FROM move_car_request WHERE target_user_id = #{targetUserId} AND deleted = 0 ORDER BY create_time DESC")
    List<MoveCarRequest> selectByTargetUserId(@Param("targetUserId") Long targetUserId);

    @Select("SELECT * FROM move_car_request WHERE requester_id = #{requesterId} AND target_space_id = #{spaceId} AND status = 0 AND deleted = 0 LIMIT 1")
    List<MoveCarRequest> selectActiveByRequesterAndSpace(@Param("requesterId") Long requesterId, @Param("spaceId") Long spaceId);

    @Update("UPDATE move_car_request SET status = #{status} WHERE id = #{id}")
    int updateStatus(@Param("id") Long id, @Param("status") Integer status);
}
