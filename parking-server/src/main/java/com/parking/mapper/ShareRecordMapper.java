package com.parking.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.parking.entity.ShareRecord;
import com.parking.vo.ShareRecordVO;
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

    @Select("SELECT * FROM share_record WHERE space_id = #{spaceId} AND status = 4 AND deleted = 0 LIMIT 1")
    ShareRecord selectPendingStopBySpaceId(@Param("spaceId") Long spaceId);

    @Update("UPDATE share_record SET status = #{status} WHERE id = #{id}")
    int updateStatus(@Param("id") Long id, @Param("status") Integer status);

    @Select("<script>" +
            "SELECT sr.id, sr.owner_id as ownerId, sr.space_id as spaceId, sr.share_type as shareType, " +
            "sr.start_time as startTime, sr.end_time as endTime, sr.hourly_price as pricePerHour, " +
            "sr.monthly_price as monthlyPrice, sr.status, sr.create_time as createTime, " +
            "ps.space_no as spaceCode, ps.lot_id as parkingId, pl.name as parkingName " +
            "FROM share_record sr " +
            "LEFT JOIN parking_space ps ON sr.space_id = ps.id " +
            "LEFT JOIN parking_lot pl ON ps.lot_id = pl.id " +
            "WHERE sr.owner_id = #{ownerId} AND sr.deleted = 0 " +
            "<if test='status != null and status != \"\"'>" +
            "AND sr.status IN (${status}) " +
            "</if>" +
            "ORDER BY sr.create_time DESC " +
            "LIMIT #{offset}, #{pageSize}" +
            "</script>")
    List<ShareRecordVO> selectVOList(@Param("ownerId") Long ownerId,
                                      @Param("status") String status,
                                      @Param("offset") Integer offset,
                                      @Param("pageSize") Integer pageSize);

    @Select("SELECT COUNT(*) FROM share_record WHERE owner_id = #{ownerId} AND deleted = 0")
    int countByOwnerId(@Param("ownerId") Long ownerId);

    @Select("SELECT COUNT(*) FROM share_record WHERE owner_id = #{ownerId} AND status = 1 AND deleted = 0")
    int countActiveByOwnerId(@Param("ownerId") Long ownerId);

    @Select("SELECT * FROM share_record WHERE status = 1 AND end_time < #{now} AND deleted = 0")
    List<ShareRecord> selectExpired(@Param("now") java.time.LocalDateTime now);
}
