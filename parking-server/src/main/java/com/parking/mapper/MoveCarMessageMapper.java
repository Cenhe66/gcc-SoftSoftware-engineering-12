package com.parking.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.parking.entity.MoveCarMessage;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

@Mapper
public interface MoveCarMessageMapper extends BaseMapper<MoveCarMessage> {

    @Select("SELECT * FROM move_car_message WHERE request_id = #{requestId} AND deleted = 0 ORDER BY create_time ASC")
    List<MoveCarMessage> selectByRequestId(@Param("requestId") Long requestId);

    @Select("SELECT * FROM move_car_message WHERE receiver_id = #{receiverId} AND deleted = 0 ORDER BY create_time DESC")
    List<MoveCarMessage> selectByReceiverId(@Param("receiverId") Long receiverId);

    @Update("UPDATE move_car_message SET is_read = 1 WHERE receiver_id = #{receiverId} AND is_read = 0 AND deleted = 0")
    int markReadByReceiverId(@Param("receiverId") Long receiverId);
}
