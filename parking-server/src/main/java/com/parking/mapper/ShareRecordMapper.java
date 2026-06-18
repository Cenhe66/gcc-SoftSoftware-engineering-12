package com.parking.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.parking.entity.ShareRecord;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

@Mapper
public interface ShareRecordMapper extends BaseMapper<ShareRecord> {

    @Select("SELECT * FROM share_record WHERE owner_id = #{ownerId} AND deleted = 0 ORDER BY create_time DESC")
    List<ShareRecord> selectByOwnerId(@Param("ownerId") Long ownerId);

    @Select("SELECT * FROM share_record WHERE space_id = #{spaceId} AND status = 1 AND deleted = 0")
    List<ShareRecord> selectActiveBySpaceId(@Param("spaceId") Long spaceId);

    @Update("UPDATE share_record SET status = #{status} WHERE id = #{id}")
    int updateStatus(@Param("id") Long id, @Param("status") Integer status);
}
