package com.parking.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.parking.entity.Reservation;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface ReservationMapper extends BaseMapper<Reservation> {

    @Select("SELECT * FROM reservation WHERE user_id = #{userId} AND deleted = 0 ORDER BY create_time DESC")
    List<Reservation> selectByUserId(@Param("userId") Long userId);

    @Select("SELECT * FROM reservation WHERE space_id = #{spaceId} AND status = 0 AND deleted = 0")
    List<Reservation> selectActiveBySpaceId(@Param("spaceId") Long spaceId);

    @Update("UPDATE reservation SET status = #{status} WHERE id = #{id}")
    int updateStatus(@Param("id") Long id, @Param("status") Integer status);

    @Update("UPDATE reservation SET status = #{status}, entry_time = #{entryTime} WHERE id = #{id}")
    int updateEntry(@Param("id") Long id, @Param("status") Integer status, @Param("entryTime") LocalDateTime entryTime);

    @Update("UPDATE reservation SET status = #{status}, cancel_time = #{cancelTime} WHERE id = #{id}")
    int updateCancel(@Param("id") Long id, @Param("status") Integer status, @Param("cancelTime") LocalDateTime cancelTime);

    @Select("SELECT * FROM reservation WHERE status = 0 AND end_time < #{now} AND deleted = 0")
    List<Reservation> selectExpired(@Param("now") LocalDateTime now);
}
